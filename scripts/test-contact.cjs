/* Offline behavioural checks of the real contact.js. fetch is always mocked. */
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/contact.js'), 'utf8');

function fixture(search = '') {
  const nodes = new Map();
  let focus, calls = 0, response = Promise.resolve({ ok: true });
  function node(id, value = '') {
    const attributes = new Map();
    const events = {};
    let error;
    const wrap = { querySelector: () => error, appendChild: n => { error = n; } };
    const result = {
      id, value, hidden: false, disabled: false, innerHTML: 'Envoyer →', textContent: '',
      setAttribute: (k, v) => attributes.set(k, v),
      removeAttribute: k => attributes.delete(k),
      getAttribute: k => attributes.get(k),
      addEventListener: (k, fn) => { events[k] = fn; },
      closest: () => wrap, focus: () => { focus = id; }, events,
    };
    nodes.set(id, result);
    return result;
  }
  const form = node('contact-form');
  form.action = 'https://example.invalid/never-sent';
  const submit = node('submit');
  form.querySelector = () => submit;
  node('form-status'); node('need'); node('name'); node('email'); node('message');
  vm.runInNewContext(source, {
    document: { getElementById: id => nodes.get(id), createElement: () => node('error') },
    window: { location: { search } }, URLSearchParams, Map,
    FormData: class {},
    fetch: () => { calls++; return response; },
  });
  return { nodes, form, submit, get calls() { return calls; }, get focus() { return focus; },
    setResponse: value => { response = value; },
    send: () => form.events.submit({ preventDefault() {} }),
    valid: () => { nodes.get('name').value = 'Test local'; nodes.get('email').value = 'local@example.invalid'; nodes.get('message').value = 'Test simulé, aucun envoi.'; },
  };
}

(async () => {
  const invalid = fixture();
  assert.equal(invalid.form.noValidate, true);
  await invalid.send();
  assert.equal(invalid.calls, 0);
  assert.equal(invalid.focus, 'name');
  assert.equal(invalid.nodes.get('name').getAttribute('aria-invalid'), 'true');
  invalid.nodes.get('name').events.input();
  assert.equal(invalid.nodes.get('name').getAttribute('aria-invalid'), undefined);
  invalid.valid(); invalid.nodes.get('email').value = 'incomplete';
  await invalid.send(); assert.equal(invalid.calls, 0); assert.equal(invalid.focus, 'email');

  for (const query of ['marque', 'contenus', 'site', 'plateforme', 'automatisation', 'diagnostic']) {
    assert.notEqual(fixture('?projet=' + query).nodes.get('need').value, '');
  }
  assert.equal(fixture('?projet=%3Cscript%3E').nodes.get('need').value, '');

  const ok = fixture(); ok.valid();
  let resolve;
  ok.setResponse(new Promise(r => { resolve = r; }));
  const pending = ok.send();
  assert.equal(ok.submit.disabled, true);
  assert.equal(ok.form.getAttribute('aria-busy'), 'true');
  await ok.send(); assert.equal(ok.calls, 1);
  resolve({ ok: true }); await pending;
  assert.equal(ok.form.hidden, true); assert.equal(ok.focus, 'form-status');
  assert.equal(ok.form.getAttribute('aria-busy'), undefined);

  for (const networkError of [false, true]) {
    const fail = fixture(); fail.valid();
    fail.setResponse(networkError ? Promise.reject(new Error('offline')) : Promise.resolve({ ok: false }));
    await fail.send();
    assert.equal(fail.submit.disabled, false);
    assert.equal(fail.form.hidden, false);
    assert.equal(fail.focus, 'form-status');
    assert.match(fail.nodes.get('form-status').textContent, /échoué/);
    assert.equal(fail.nodes.get('message').value, 'Test simulé, aucun envoi.');
    fail.setResponse(Promise.resolve({ ok: true })); await fail.send();
    assert.equal(fail.form.hidden, true);
  }
  console.log('Contact: validation, allowlist, pending/double-submit, success, HTTP/network failure and retry passed (offline).');
})().catch(error => { console.error(error); process.exitCode = 1; });

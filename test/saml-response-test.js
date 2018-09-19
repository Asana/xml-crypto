var crypto = require('../index');
var xmldom = require('xmldom');
var fs = require('fs');

exports['test validating SAML response'] = function (test) {
  var xml = fs.readFileSync('./test/static/valid_saml.xml', 'utf-8');
  var doc = new xmldom.DOMParser().parseFromString(xml);
  var signature = crypto.xpath(doc, "/*/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
  var sig = new crypto.SignedXml();
  sig.keyInfoProvider = new crypto.FileKeyInfo("./test/static/feide_public.pem");
  sig.loadSignature(signature);
  var result = sig.checkSignature(xml);
  test.equal(result, true);
  test.done();
};

exports['test validating wrapped assertion signature'] = function (test) {
  var xml = fs.readFileSync('./test/static/valid_saml_signature_wrapping.xml', 'utf-8');
  var doc = new xmldom.DOMParser().parseFromString(xml);
  var assertion = crypto.xpath(doc, "//*[local-name(.)='Assertion']")[0];
  var signature = crypto.xpath(assertion, "//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
  var sig = new crypto.SignedXml();
  sig.keyInfoProvider = new crypto.FileKeyInfo("./test/static/feide_public.pem");
  sig.loadSignature(signature);
  test.throws(
    function() {
      sig.checkSignature(xml);
    },
    Error,
    'Should not validate a document which contains multiple elements with the ' +
    'same value for the ID / Id / Id attributes, in order to prevent ' +
    'signature wrapping attack.'
  );
  test.done();
};

exports['test validating SAML response where a namespace is defined outside the signed element'] = function (test) {
  var xml = fs.readFileSync('./test/static/saml_external_ns.xml', 'utf-8');
  var doc = new xmldom.DOMParser().parseFromString(xml);
  var signature = crypto.xpath(doc, "//*//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
  var sig = new crypto.SignedXml();
  sig.keyInfoProvider = new crypto.FileKeyInfo("./test/static/saml_external_ns.pem");
  sig.loadSignature(signature);
  var result = sig.checkSignature(xml);
  test.equal(result, true);
  test.done();
};

exports['test reference id does not contain quotes'] = function (test) {
  var xml = fs.readFileSync('./test/static/id_with_quotes.xml', 'utf-8');
  var doc = new xmldom.DOMParser().parseFromString(xml);
  var assertion = crypto.xpath(doc, "//*[local-name(.)='Assertion']")[0];
  var signature = crypto.xpath(assertion, "//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
  var sig = new crypto.SignedXml();
  sig.keyInfoProvider = new crypto.FileKeyInfo("./test/static/feide_public.pem");
  sig.loadSignature(signature);
  test.throws(
    function() {
      sig.checkSignature(xml);
    },
    Error,
    'id should not contain quotes'
  );
  test.done();
};

exports['test validating SAML response WithComments'] = function (test) {
  var xml = fs.readFileSync('./test/static/valid_saml_withcomments.xml', 'utf-8');
  var doc = new xmldom.DOMParser().parseFromString(xml);
  var signature = crypto.xpath(doc, "/*/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
  var sig = new crypto.SignedXml();
  sig.keyInfoProvider = new crypto.FileKeyInfo("./test/static/feide_public.pem");
  sig.loadSignature(signature);
  test.throws(
      function() {
        sig.checkSignature(xml)
      },
      Error,
      'invalid signature: the signature value dkONrkxW+LSuDvnNMG/mWYFa47d2WGyapLhXSTYqrlT9Td+tT7ciojNJ55WTaPaCMt7IrGtIxxskPAZIjdIn5pRyDxHr0joWxzZ7oZHCOI1CnQV5HjOq+rzzmEN2LctCZ6S4hbL7SQ1qJ3vp2BCXAygy4tmJOURQdnk0KLwwRS8= is incorrect'
  )
  test.done();
};

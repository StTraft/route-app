'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _queryGoogle = require('./queryGoogle.js');

var _queryGoogle2 = _interopRequireDefault(_queryGoogle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.get('/', _queryGoogle2.default);

app.listen(3000, function () {
  return console.log('Listening on port 3000!');
});
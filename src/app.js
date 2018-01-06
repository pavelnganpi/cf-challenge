import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import routes from './routes';
import { SCHEMA_NAMES } from './constants';
import { CertificateModel } from './models/certificate';
import { CustomerModel } from './models/customer';
import { getDBUrl } from './util';
console.log("getDBUrl", getDBUrl());

// db connection setup
const mongoose = require('mongoose');
mongoose.connect(getDBUrl());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	// we're connected!
	console.log('db connected');
});

const app = express();
app.disable('x-powered-by');

app.use(logger('dev', {
  skip: () => app.get('env') === 'test'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.set(SCHEMA_NAMES.CUSTOMER, CustomerModel);
app.set(SCHEMA_NAMES.CERTIFICATE, CertificateModel);

// Routes
app.use('/', routes);

// Catch 404 return error message
app.use((req, res) => {
  res.status(404).send({ message: "route not supported"});
});

export default app;

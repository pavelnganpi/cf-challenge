import { SCHEMA_NAMES,HTTP_STATUS, ERROR_MESSAGES } from './constants';
import { Router } from 'express';
const routes = Router();
import {
	notifyExternalSystem,
	validateCustomer,
	validateCreateCustomerReqBody,
	validateCreateCertificateReqBody,
	validateUpdateCertificateReqBody,
	hashPassword
} from './util';

/**
 * GET home page
 */
routes.get('/', (req, res) => {
	res.status(200).json({message: " welcome to CloudFlare management"});
});

/**
 * Create Customer
 */
routes.post('/customer', async (req, res) => {
	const CustomerModel = req.app.get(SCHEMA_NAMES.CUSTOMER);
	const payload = req.body;

	// validate request body
	const reqValResult = validateCreateCustomerReqBody(payload);
	if (reqValResult.status !== HTTP_STATUS.OK) {
		return res.status(reqValResult.status).send({ message: reqValResult.message });
	}

	// hash password to store in db
	payload.password = await hashPassword(payload.password);

	const customer = await CustomerModel.find({ email: payload.email });
	// avoid creating duplicate customers
	if (customer.length !== 0) {
		return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: ERROR_MESSAGES.CUSTOMER_ALREADY_EXISTS});
	}

	// create and save customer in db
	CustomerModel.create(payload, (err) => {
		if (err) { return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR}); }
		return res.status(HTTP_STATUS.CREATED).send({ message: 'success'});
	});
});


/**
 * Delete Customer
 */
routes.delete('/customer', async (req, res) => {
	const CustomerModel = req.app.get(SCHEMA_NAMES.CUSTOMER);
	const email = req.query.email;

	// validate email is present
	if (email === null || email === undefined) {
		return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: ERROR_MESSAGES.EMAIL_MISSING });
	}

	// validate customer exists
	const valRes = await validateCustomer(email, CustomerModel);
	if (valRes.status !== HTTP_STATUS.OK) {
		return res.status(valRes.status).send({ message: valRes.message });
	}

	CustomerModel.update({ email }, { deleted: true }, { multi: true }, (err) => {
		if (err) { return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR}); }
		return res.status(HTTP_STATUS.NO_CONTENT).send();
	});
});

/**
 * Create Certificate
 */
routes.post('/certificate', async(req, res) => {
	const payload = req.body;

	// validate request body
	const reqValResult = validateCreateCertificateReqBody(payload);
	if (reqValResult.status !== HTTP_STATUS.OK) {
		return res.status(reqValResult.status).send({ message: reqValResult.message });
	}

	const CustomerModel = req.app.get(SCHEMA_NAMES.CUSTOMER);
	const CertificateModel = req.app.get(SCHEMA_NAMES.CERTIFICATE);

	// validate customer exists
	const valRes = await validateCustomer(payload.email, CustomerModel);
	if (valRes.status !== HTTP_STATUS.OK) {
		return res.status(valRes.status).send({ message: valRes.message });
	}
	const customer = await CustomerModel.findOne({ email: payload.email });

	CertificateModel.create({ ...payload, customerId: customer._id.toString() }, (err) => {
		if (err) { return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR}); }
		return res.status(HTTP_STATUS.CREATED).send({ message: 'success'});
	});
});

/**
 * Get all customer's active certificates
 */
routes.get('/certificate', async (req, res) => {
	const customerId = req.query.customerId;
	const CertificateModel = req.app.get(SCHEMA_NAMES.CERTIFICATE);
	const certificates = await CertificateModel.find({ customerId, isActive: true });
	return res.status(HTTP_STATUS.OK).send(certificates);
});

/**
 * Activate / Deactivate a certificate
 */
routes.put('/certificate', async (req, res) => {
	const payload = req.body;

	// validate request body
	const reqValResult = validateUpdateCertificateReqBody(payload);
	if (reqValResult.status !== HTTP_STATUS.OK) {
		return res.status(reqValResult.status).send({ message: reqValResult.message });
	}

	const CertificateModel = req.app.get(SCHEMA_NAMES.CERTIFICATE);
	const certificate = await CertificateModel.find({ _id: payload.certificateId });

	// check certificate exist in db
	if (certificate.length === 0) {
		return res.status(HTTP_STATUS.NOT_FOUND).send({ message: ERROR_MESSAGES.CERTIFICATE_NOT_FOUND});
	}

	CertificateModel.update({ _id: payload.certificateId }, { isActive: payload.isActive }, (err) => {
		if (err) { return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR}); }
		notifyExternalSystem(payload.certificateId, payload.isActive);
		return res.status(HTTP_STATUS.OK).send({ message: 'success'});
	});
});

export default routes;

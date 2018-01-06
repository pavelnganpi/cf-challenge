import {ERROR_MESSAGES, HTTP_STATUS} from "./constants";
const bcrypt = require('bcrypt');
const request = require('request');
const env = process.env.NODE_ENV;

function notifyExternalSystem(certificateId, isActive) {
	const action = isActive ? 'activated' : 'deactivate';
	request({
		json: true,
		method: 'POST',
		uri: 'https://requestb.in/1bt49bi1',
		body: { certificateId, action },
	});
}

function getDBUrl() {
	if(env === 'test') {
		return 'mongodb://localhost:27017/test';
	} else {
		return 'mongodb://localhost:27017/cloudflare';
	}
}

async function validateCustomer(email, CustomerModel) {
	const customer = await CustomerModel.find({ email });
	const result = {
		status: HTTP_STATUS.OK,
		message: '',
	};

	// check customer exist in db
	if (customer.length === 0) {
		result.status = HTTP_STATUS.NOT_FOUND;
		result.message = ERROR_MESSAGES.CUSTOMER_NOT_FOUND;
	}

	return result;
}

function validateCreateCustomerReqBody(payload) {
	const result = {
		status: HTTP_STATUS.BAD_REQUEST,
		message: '',
	};

	if (payload.name === null || payload.name === '' || payload.name === undefined) {
		result.message = ERROR_MESSAGES.NAME_MISSING;
	} else if (payload.email === null || payload.email === '' || payload.email === undefined) {
		result.message = ERROR_MESSAGES.EMAIL_MISSING;
	} else if (payload.password === null || payload.password === '' || payload.password === undefined) {
		result.message = ERROR_MESSAGES.PASSWORD_MISSING;
	} else {
		result.status = HTTP_STATUS.OK;
	}

	return result;
}

function validateCreateCertificateReqBody(payload) {
	const result = {
		status: HTTP_STATUS.BAD_REQUEST,
		message: '',
	};

	if (payload.privateKey === null || payload.privateKey === '' || payload.privateKey === undefined) {
		result.message = ERROR_MESSAGES.PRIVATE_KEY_MISSING;
	} else if (payload.body === null || payload.body === '' || payload.body === undefined) {
		result.message = ERROR_MESSAGES.BODY_MISSING;
	} else if (payload.isActive === null || typeof payload.isActive !== 'boolean' || payload.isActive === undefined) {
		result.message = ERROR_MESSAGES.IS_ACTIVE_MISSING;
	} else if (payload.email === null || payload.email === '' || payload.email === undefined) {
		result.message = ERROR_MESSAGES.EMAIL_MISSING;
	} else {
		result.status = HTTP_STATUS.OK;
	}

	return result;
}

function validateUpdateCertificateReqBody(payload) {
	const result = {
		status: HTTP_STATUS.BAD_REQUEST,
		message: '',
	};

	if (payload.certificateId === null || payload.certificateId === '' || payload.certificateId === undefined) {
		result.message = ERROR_MESSAGES.CERTIFICATE_ID_MISSING;
	} else if (payload.isActive === null || typeof payload.isActive !== 'boolean' || payload.isActive === undefined) {
		result.message = ERROR_MESSAGES.IS_ACTIVE_MISSING;
	} else {
		result.status = HTTP_STATUS.OK;
	}

	return result;
}

async function hashPassword(password) {
	const saltRounds = 10;
	return await bcrypt.hash(password, saltRounds);
}

export {
	notifyExternalSystem,
	getDBUrl,
	validateCustomer,
	validateCreateCustomerReqBody,
	validateCreateCertificateReqBody,
	validateUpdateCertificateReqBody,
	hashPassword
}


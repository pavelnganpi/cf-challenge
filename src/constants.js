const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	NOT_FOUND: 404,
	INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
	CUSTOMER_ALREADY_EXISTS: 'customer already exists',
	INTERNAL_SERVER_ERROR: 'internal server error',
	CUSTOMER_NOT_FOUND: 'customer not found',
	CERTIFICATE_NOT_FOUND: 'customer not found',
	TO_MISSING: 'to field is missing',
	BODY_MISSING: 'body field is missing',
	NAME_MISSING: 'name cannot be null or empty',
	EMAIL_MISSING: 'email cannot be null or empty',
	PASSWORD_MISSING: 'password cannot be null or empty',
	PRIVATE_KEY_MISSING: 'private cannot be null or empty',
	IS_ACTIVE_MISSING: 'isActive cannot be null or empty and must be a boolean',
	CERTIFICATE_ID_MISSING: 'certificateId cannot be null or empty',
};

const SCHEMA_NAMES = {
	CUSTOMER: 'Customer',
	CERTIFICATE: 'Certificates'
};

export {
	HTTP_STATUS,
	ERROR_MESSAGES,
	SCHEMA_NAMES,
}

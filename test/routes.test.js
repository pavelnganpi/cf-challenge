import request from 'supertest';
const mongoose = require('mongoose');
import { HTTP_STATUS, ERROR_MESSAGES } from '../src/constants';
import app from '../src/app.js';
import { CustomerModel } from '../src/models/customer';
import { CertificateModel } from '../src/models/certificate';
const assert = require('chai').assert;

describe('GET /', () => {
  it('should render properly', async () => {
    await request(app).get('/').expect(HTTP_STATUS.OK);
  });
});

describe('POST /customer', () => {
	beforeEach(() => {
		clearCustomersDb();
		clearCertificatesDb()
	});

	afterEach(() => {
		clearCustomersDb();
		clearCertificatesDb();
	});

  it('should return successfully create a customer', async () => {
    await request(app)
      .post('/customer')
			.send({
				'name': 'pavey nganpi',
				'email': 'email@email.com',
				'password': 'onepieceisthebestanime',

			})
			.expect(HTTP_STATUS.CREATED, {
				message: 'success'
			});
  });
});

describe('DELETE /customer', () => {
	beforeEach(() => {
		clearCustomersDb();
		clearCertificatesDb()
	});

	afterEach(() => {
		clearCustomersDb();
		clearCertificatesDb();
	});

	it('should return customer not found error', async () => {
		await request(app)
			.delete('/customer?email=email@email.com')
			.expect(HTTP_STATUS.NOT_FOUND,{
				message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
			});
	});

	it('should successfully delete a customer', async () => {
		const email = 'email@email.com';
		await request(app)
			.post('/customer')
			.send({
				'name': 'pavey nganpi',
				'email': email,
				'password': 'onepieceisthebestanime',

			});

		await request(app)
			.delete(`/customer?email=${email}`)
			.expect(HTTP_STATUS.NO_CONTENT);
	});
});

describe('Post /certificate', () => {
	beforeEach(() => {
		clearCustomersDb();
		clearCertificatesDb()
	});

	afterEach(() => {
		clearCustomersDb();
		clearCertificatesDb();
	});

	it('should return bad request response for customer not found when creating a certificate', async () => {
		await request(app)
			.post('/certificate')
			.send({
				"email": "email@gmail.com",
				"privateKey": "private key",
				"body": "chelseafc",
				"isActive": true
			})
			.expect(HTTP_STATUS.NOT_FOUND, {
				message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
			});
	});

	it('should successfully create a certificate', async () => {
		const email = 'email@email.com';
		await request(app)
			.post('/customer')
			.send({
				'name': 'pavey nganpi',
				'email': email,
				'password': 'onepieceisthebestanime',

			});

		await request(app)
			.post('/certificate')
			.send({
				"email": email,
				"privateKey": "private key",
				"body": "chelseafc",
				"isActive": true
			})
			.expect(HTTP_STATUS.CREATED,{
				message: 'success',
			});
	});
});

describe('Get /certificate', () => {
	beforeEach(() => {
		clearCustomersDb();
		clearCertificatesDb()
	});

	afterEach(() => {
		clearCustomersDb();
		clearCertificatesDb();
	});

	it('should return empty list of certificate for customer with no certificates', async () => {
		await request(app)
			.get('/certificate?customerId=5a50325197d6dc7a16b439622')
			.expect(HTTP_STATUS.OK, []);
	});

	it('should return all certificates for customer', async () => {
		const email = 'email@email.com';
		await request(app)
			.post('/customer')
			.send({
				'name': 'pavey nganpi',
				'email': email,
				'password': 'onepieceisthebestanime',

			});

		await request(app)
			.post('/certificate')
			.send({
				"email": email,
				"privateKey": "private key",
				"body": "chelseafc",
				"isActive": true
			});

		await request(app)
			.post('/certificate')
			.send({
				"email": email,
				"privateKey": "another private key",
				"body": "naruto is the best anime",
				"isActive": true
			});

		await request(app)
			.get(`/certificate?customerId=${await findCustomerId(email)}`)
			.expect(HTTP_STATUS.OK)
			.expect(function(res) {
				assert.lengthOf(res.body, 2);
			})
	});
});

describe('Put /certificate', () => {
	beforeEach(() => {
		clearCustomersDb();
		clearCertificatesDb()
	});

	afterEach(() => {
		clearCustomersDb();
		clearCertificatesDb();
	});

	it('should deactivate a certificate', async () => {
		const certificate = await CertificateModel.create({
			customerId: new mongoose.Types.ObjectId().toString(),
			privateKey: 'privateKey',
			body: 'body',
			isActive: true,
		});

		await request(app)
			.put('/certificate')
			.send({
				'certificateId': certificate._id,
				"isActive": false,
			})
			.expect(HTTP_STATUS.OK,{
				message: 'success',
			});

		const updatedCertificate = await CertificateModel.findById(certificate._id);
		assert.isFalse(updatedCertificate.isActive);
	});
});

describe('GET /404', () => {
  it('should return 404 for non-existent URLs', async () => {
    await request(app).get('/404').expect(404);
    await request(app).get('/notfound').expect(404);
  });
});

function clearCustomersDb() {
	CustomerModel.remove({}, () => {});
}

function clearCertificatesDb() {
	CertificateModel.remove({}, () => {});
}

async function findCustomerId(email) {
	const customer = await CustomerModel.findOne({ email });
	return customer._id;
}

import { SCHEMA_NAMES } from '../constants';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const certificateSchema = new Schema({
	customerId: { type: String, required: true, index: true },
	privateKey: { type: String, required: true },
	body:{ type: String, required: true },
	isActive: { type: Boolean, required: true },
},{
	timestamps: true
});

const CertificateModel = mongoose.model(SCHEMA_NAMES.CERTIFICATE, certificateSchema);
export { CertificateModel };

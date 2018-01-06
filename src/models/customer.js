import { SCHEMA_NAMES } from '../constants';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
	name: { type: String, required: true },
	password:{ type: String, required: true },
	email: { type: String, required: true, index: true },
	deleted: { type: Boolean, default: false }
},{
	timestamps: true
});

customerSchema.pre('find', function(next) {
	this.where({deleted: false});
	next();
});
const CustomerModel = mongoose.model(SCHEMA_NAMES.CUSTOMER, customerSchema);
export { CustomerModel };

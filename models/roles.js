const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rolesSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        }
    }
);

const Role = mongoose.model('Role', rolesSchema);

module.exports = Role;
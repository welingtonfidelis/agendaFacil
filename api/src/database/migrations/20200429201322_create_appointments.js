exports.up = function(knex) {
    return knex.schema.createTable('appointments', function(table) {
        table.increments();
        table.string('patientName').notNullable();
        table.string('patientPhone').notNullable();
        table.date('date').notNullable();

        table.string('doctorId').notNullable();
        table.foreign('doctorId').references('id').inTable('doctors');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('appointments');
};

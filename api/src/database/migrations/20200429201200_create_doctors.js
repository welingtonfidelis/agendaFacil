exports.up = function(knex) {  
    return knex.schema.createTable('doctors', function(table) {
        table.increments();
        table.string('name').notNullable();
        table.string('phone').notNullable();
        table.string('checkIn').notNullable();
        table.string('checkOut').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('doctors');
};

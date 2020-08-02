const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { 
          name: 'usuario1', 
          login: 'usuario1', 
          password: bcrypt.hashSync('1234', 10) 
        },
      ]);
    });
};

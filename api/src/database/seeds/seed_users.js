
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { name: 'usuario1', login: 'usuario1', password: '1234' },
        { name: 'usuario2', login: 'usuario2', password: '1234' },
      ]);
    });
};

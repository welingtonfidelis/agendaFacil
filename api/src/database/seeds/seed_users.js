
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { 
          name: 'usuario1', 
          login: 'usuario1', 
          password: '$2b$10$P4iIftMu6WzzeuBdvGpti.B54CakNBo0/82yt7hPU5q1K8ep0iwPi' 
        },
      ]);
    });
};

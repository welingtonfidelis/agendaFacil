
# agendaFacil

* [obs] Este projeto é uma refatoração de uma [versão anterior] focada apenas no front-end em React, onde  a biblioteca  [JSON server] foi utilizada como back-end. 

Construído com objetivo de atender necessidades de consultórios médicos em controlar agenda de consultas aos pacientes. Através deste sistema simplificado, é possível cadastrar médicos, consultas e usuários (para acesso ao sistema), com controle de intervalo de tempo entre as consultas, incluindo não permitir consultas em mesma data e horário. O front-end foi construído em React, o back-end utilizando NodeJs e para banco de dados optou-se por sqlite.

### Requisitos

* [NodeJs] - Nodejs 10 ou superior
* [React] - React

### Instalação

Clonar este projeto, entrar na pasta "api" e executar o comando npm install ou yarn install através do terminal. Em seguida, ainda dentro da pasta "api", execute o comando "npx knex migrate:latest" para a criação do banco de dados local (src/database/sqlite.db). O sistema possui login obrigatório, considerando que o banco é criado com tabelas vazias, execute o comando "npx knex seed:run" para que um usuário padrão seja criado (usuário: usuario1, senha: 1234). O projeto utiliza [jsonwebtoken] para geração e validação de requisições através de tokens e, para uma melhor prática de segurança, uma senha deve ser criada em um arquivo .env dentro da raiz do projeto, como mostra o exemplo .env.example.  Por fim, execute o comando npm run start ou yarn start para que o servidor seja executado na porta 3001 (esta porta pode ser alterada no arquivi src/server.js).
Para executar o front-end, entre na pasta "web", execute o comando npm istall ou yarn install, em seguida o comando npm start ou yarn start e aguarde até que uma página seja aberta em seu navegador padrão.
* [obs] O banco escolhido inicialmente foi sqlite, mas a biblioteca [knex] permite a utilização de outros tipos de bancos sql, sendo necessário algumas poucas configurações partindo do arquivo knexfile.js na raíz do projeto.
 
### Contato
welingtonfidelis@gmail.com
Sujestões e pull requests são sempre bem vindos =) 

License
----

MIT

**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[NodeJs]: <https://nodejs.org/en/>
[React]: <https://pt-br.reactjs.org/docs/getting-started.html>
[JSON server]: <https://www.npmjs.com/package/json-server>
[versão anterior]: <https://github.com/welingtonfidelis/agendaConsulta>
[jsonwebtoken]: <https://www.npmjs.com/package/jsonwebtoken>
[knex]: <http://knexjs.org/>
;

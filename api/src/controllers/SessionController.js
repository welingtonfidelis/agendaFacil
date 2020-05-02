const connection = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

module.exports = {
    async sessionSign(req, res) {
        try {
            const { login, password } = req.body;

            let [query] = await connection('users')
            .select('id', 'name', 'password')
            .where('login', 'like', login)
            .limit(1);

            if (query) {
                const { id, name } = query, hash = query.password;

                const isValid = await bcrypt.compareSync(password, hash);

                if (isValid) {
                    const token = jwt.sign({ id, name }, process.env.SECRET, {
                        // expiresIn: '12h'
                    });

                    query = { name, token };
                    return res.json({status: true, response: query});
                } 
                else return res.status(200).json({ status: false, response: 'invalid login', code: 10 });
            } 
            else return res.status(500).json({ status: false, response: 'error' });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }

    },
}
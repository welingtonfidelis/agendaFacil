const connection = require('../database/connection');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    async store(req, res) {
        try {
            let { data } = req.body;

            data.password = bcrypt.hashSync(data.password, saltRounds);

            const [ id ] = await connection('users').insert(data);
            
            return res.json({ status: true, response: id });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async update(req, res) {
        try {
            const { data } = req.body, { id } = req.params;
            
            if(data.password) data.password = bcrypt.hashSync(data.password, saltRounds);

            const query = await connection('users')
                .where({ id })
                .update(data);
            
            return res.json({ status: true, response: query });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async index(req, res) {
        try {
            let { page } = req.query, limit = 10;
    
            const [count] = await connection('users').count();

            if(!page) {
                page = 1;
                limit = count['count(*)'];
            }
    
            const query = await connection('users')
            .select('id', 'name', 'login')
            .limit(limit)
            .offset((page - 1) * 10)
            .orderBy('name', 'asc');
    
            return res.json({status: true, response: query, count});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async indexByLogin(req, res) {
        try {
            const { login } = req.query;
    
            const query = await connection('users')
            .where('login', 'like', login)
            .select('id')
            .limit(1);
    
            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;
    
            const [query] = await connection('users')
            .select('name', 'login')
            .where({ id })
            .limit(1);
    
            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const query = await connection('users')
            .where({ id })
            .delete();

            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    }
}
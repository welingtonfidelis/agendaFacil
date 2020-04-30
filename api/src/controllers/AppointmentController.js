const connection = require('../database/connection');

module.exports = {
    async store(req, res) {
        try {
            const { data } = req.body;

            const [ id ] = await connection('appointments').insert(data);
            
            return res.json({ status: true, response: id });
            
        } catch (error) {
            console.log(error);
            return res.json({ status: false, response: error });
        }
    },

    async update(req, res) {
        try {
            const { data } = req.body, { id } = req.params;

            const query = await connection('appointments')
                .where({ id })
                .update(data);
            
            return res.json({ status: true, response: query });
            
        } catch (error) {
            console.log(error);
            return res.json({ status: false, response: error });
        }
    },

    async index(req, res) {
        try {
            const { page = 1 } = req.query;
    
            const [count] = await connection('appointments').count();
    
            const query = await connection('appointments')
            .limit(10)
            .offset((page - 1) * 10)
    
            return res.json({status: true, response: query, count});
            
        } catch (error) {
            console.log(error);
            return res.json({ status: false, response: error });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;
    
            const query = await connection('appointments')
            .where({ id });
    
            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.json({ status: false, response: error });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const query = await connection('appointments')
            .where({ id })
            .delete();

            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.json({ status: false, response: error });
        }
    }
}
const connection = require('../database/connection');

module.exports = {
    async store(req, res) {
        try {
            const { data } = req.body;

            const [ id ] = await connection('appointments').insert(data);
            
            return res.json({ status: true, response: id });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
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
            return res.status(500).json({ status: false, response: error });
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
            return res.status(500).json({ status: false, response: error });
        }
    },

    async indexByDate(req, res) {
        try {
            const { start, end, doctorId } = req.query;


            let query = null;
            if(doctorId) {
                query = await connection('appointments')
                    .whereBetween('date', [start, end])
                    .where({ doctorId })
                    .join('doctors', 'doctors.id', '=', 'appointments.doctorId')
                    .select(['appointments.*', 'doctors.name as doctorName'])
                    .orderBy('date', 'asc');
            }
            else {
                query = await connection('appointments')
                    .whereBetween('date', [start, end])
                    .join('doctors', 'doctors.id', '=', 'appointments.doctorId')
                    .select(['appointments.*', 'doctors.name as doctorName'])
                    .orderBy('date', 'asc');
            }
    
            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;
    
            const [query] = await connection('appointments')
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
            
            const query = await connection('appointments')
            .where({ id })
            .delete();

            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    }
}
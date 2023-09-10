const express = require("express");
const slugify = require("slugify"); 
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");



router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies ORDER BY name`);
        return res.json({ "companies": results.rows });
    } catch(e) {
        return next(e);
    }
});

router.get('/:code', async (req , res, next) => {
    try {
        let code = req.params.code;
        const compResult = await db.query(`SELECT code, name, description FROM companies WHERE code=$1`, [code]);  
        const invResult  = await db.query(`SELECT id FROM invoices WHERE comp_code=$1`, [code]); 
        if(compResult.rows.length === 0) {
            throw new ExpressError(`Company doesn't exists ${code}`,404)
        }     
        const company  = compResult.rows[0];
        const invoices = invResult.rows[0];

        company.invoices = invoices.map(inv => inv.id);

        return res.json({ "company": company});
    } catch(e) {
        return next(e);
    }
});

router.post('/', async (req, res ,next) => {
    try {
        let { name, description} = req.body;
        let code = slugify(name, { lower:true });
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        return res.status(201).json({ "company": results.rows[0] });
    } catch(e) {
        return next(e);
    }
});

router.put('/:code', async (req, res ,next) => {
    try {
        let { name, description} = req.body;
        let code = req.params.code;
        const results = await db.query('UPDATE companies SET code=$1, name=$2, description code=$3 RETURNING code, name, description', [code, name, description]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Company doesn't exists ${code}`,404)
        } else {     
          return res.json({ "company": results.rows[0] });
        }  
    } catch(e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code', [req.params.code]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Company doesn't exists ${code}`,404)
        } else {
            return res.json({ "status": "DELETED" });
        }    
    } catch(e) {
        return next(e);
    }
})





module.exports = router;
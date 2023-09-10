process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');


let testCompany;
beforeEach(async () => {
    const result = await db.query (`INSERT INTO companies (code, name) VALUES ('apple', 'Apple') RETURNING code, name, description`)
    testCompany = result.rows[0];
})
afterAll(async () => {
    await db.end()
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

// describe("HOPE THIS WORKS!!!", () => {
//     test("BLAH, BLAH, BLAH", () => {
//         console.log(testCompany);
//         expect(1).toBe(1);
//     })
// })




// afterAll(async () => {
//     await db.end();
// })

describe("GET /", () => {
    test("It should return a list of companies", async function () {
        const res = await request(app).get(`/companies`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ 
            "companies": [
                { code: "apple", name: "Apple"}, 
                
            ]
        });
    })
});

describe("GET /apple", () => {
    test("Gives back company specs", async () => {
        const res = await request(app).get(`/companies/apple`);    
        if (res.body && res.body.company) {
            expect(res.body).toEqual(
                { 
                    "company": { 
                        code: "apple", 
                        name: "Apple", 
                        description: "iphone developer", 
                        invoices: [1, 2],
                    }
                }
            );    
        }
    });
    test(`It should return a 404 status code for no-such-company.`, async () => {
        const res = await request(app).get(`/companies/lemon`);
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /", () => {
    test("To add a company", async () => {
        const res = await request(app)
            .post(`/companies`)
            .send({ name: "Pichurrias", description: "Pichu!" });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ "company": { code: "pichurrias", name: "Pichurrias", description: "Pichu!"}});
        
    });
    test(`code 500, Conflict!!`, async () => {
        const res = await request(app).post("/companies").send({ name: "Apple", description: "iphone1000" });
    expect(res.statusCode).toBe(500);
    })
})

describe("PUT", () => {
    test (`Update company`, async () => {
        const res = await request(app)
            .put('/companies/apple')
            .send({ name: "Apple", description: "iphone999"});
        if (res.body && res.body.company) {
        expect(res.body).toEqual({ "company": {code: "apple", name: "Apple", description: "iphone999"}});
        }
    })
    test(`It should return a 404 status code for no-such-company.`, async () => {
        const res = await request(app).get(`/companies/lemon`);
        expect(res.statusCode).toBe(404);
    })
    test(`code 500 Missing Data!!`, async () => {
        const res = await request(app)
            .put("/companies/apple")
            .send({});
        expect(res.statusCode).toBe(500);
    })
});

describe("DELETE/", () => {
    test('Delete a company', async () => {
        const res = await request(app)
            .delete("/companies/apple");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ "status": "DELETED" });
    });
    test(`It should return a 404 status code for no-such-company.`, async () => {
        const res = await request(app)
            .delete("/companies/no-such-company");
        expect(res.statusCode).toEqual(500);
    })
});

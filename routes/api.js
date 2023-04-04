const router = require('express').Router();
const mysql = require('mysql');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {users} = require('../database');

const path = require('path')

//require nodemailer
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer');
const { cp } = require('fs');
require('dotenv').config();

const db_config ={
    host: "localhost",
    user: "root",
    password: "Med1212809@",
    database: "servi-tech"
  }

  var client = mysql.createConnection(db_config);

  function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }
  // handle the connection error
    client.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
    
  

router.get('/checkadmin/:id', async (req, res) => {
    const {id} = req.params;
    const query = `SELECT * FROM admins WHERE adminid = '${id}'`;
    client.query(
        query,
        (err, result) => {
            if(result){
            if (result.length === 0) {
                res.json({isAdmin: false});
            } else {
                res.json({isAdmin: true});
            }
        }}
      );    
}); 
router.get('/clients', async (req, res) => {
    try {
       // get all the users that with id not in admins table
        const query = `SELECT * FROM users WHERE id NOT IN (SELECT adminid FROM admins)`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
          );
      
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
router.get('/client/:userid', async (req, res) => {
    try {
        // select all from table users where id = userid and
        const {userid} = req.params;
        const query = `SELECT * FROM users WHERE id = '${userid}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
          );
      
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});



router.post('/client', async (req, res) => {
    try {
        // insert into table users the values of columns :  'fullname', 'cell_phone', 'email', 'pwd', 'current_balance', 'funds_on_hold', 'withdrawable_balance', 'date_of_birth', 'country', 'company_name', 'account_number', 'btc_wallet', 'bank_name', 'swift', 'iban', 'beneficiary_name', 'beneficiary_address', 'contact_information', 'bank_address'
        const {fullname, email, pwd, current_balance, funds_on_hold, withdrawable_balance ,date_of_birth, country,company_name, account_number, btc_wallet, bank_name, swift, iban, beneficiary_name, beneficiary_address, contact_information, bank_address} = req.body;
       const plainPassword = pwd;
       console.log(plainPassword)
        const password = await bcrypt.hash(plainPassword, 10);
        
        

        const query = `INSERT INTO users (fullname, email, pwd, current_balance, funds_on_hold, withdrawable_balance ,date_of_birth, country,company_name, account_number, btc_wallet, bank_name, swift, iban, beneficiary_name, beneficiary_address, contact_information, bank_address) VALUES ('${fullname}', '${email}', '${password}', '${current_balance}', '${funds_on_hold}', '${withdrawable_balance}' ,'${date_of_birth}', '${country}', '${company_name}', '${account_number}', '${btc_wallet}', '${bank_name}', '${swift}', '${iban}', '${beneficiary_name}', '${beneficiary_address}', '${contact_information}', '${bank_address}')`;
        client.query(
            query,
            (err, result) => {
                if (err){
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
          );
        
    } catch (e) {
        console.log(e)

        res.status(500).json({message: 'Something went wrong'});
    }
});
router.post('/inspections', async (req, res) => {
    try {
        // insert into table users the values of columns :  'num_facture', 'nom_client', 'adresse', 'date_inspection', 'appareil', 'emplacement', 'capacite', 'palan', 'manufacturier', 'model', 'serie', 'chaine', 'hauteur', 'charriot', 'commande_par', 'vp', 'vc', 'inscpecte_par'
        const {num_facture, nom_client, adresse, date_inspection, appareil, emplacement, capacite, palan, manufacturier, model, serie, chaine, hauteur, charriot, commande_par, vp, vc, inscpecte_par} = req.body;
        const query = `INSERT INTO inspections (num_facture, nom_client, adresse, date_inspection, appareil, emplacement, capacite, palan, manufacturier, model, serie, chaine, hauteur, charriot, commande_par, vp, vc, inscpecte_par) VALUES ('${num_facture}', '${nom_client}', '${adresse}', '${date_inspection}', '${appareil}', '${emplacement}', '${capacite}', '${palan}', '${manufacturier}', '${model}', '${serie}', '${chaine}', '${hauteur}', '${charriot}', '${commande_par}', '${vp}', '${vc}', '${inscpecte_par}')`;     
        client.query(
            query,
            (err, result) => {
                if (err){
                    console.log(err)
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
          );
        
    } catch (e) {
        console.log(e)

        res.status(500).json({message: 'Something went wrong'});
    }
});
// delete inspection
router.delete('/inspections/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  'num_facture', 'nom_client', 'adresse', 'date_inspection', 'appareil', 'emplacement', 'capacite', 'palan', 'manufacturier', 'model', 'serie', 'chaine', 'hauteur', 'charriot', 'commande_par', 'vp', 'vc', 'inscpecte_par
        const {id} = req.params;
        const query = `DELETE FROM inspections WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// get inspection by id 
router.get('/inspections/:id', async (req, res) => {
    try {
        const {id}= req.params;
        const query = `SELECT * FROM inspections WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );
        }
    catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});






        
// delete soumission
router.delete('/soumissions/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  'num_facture', 'nom_client', 'adresse', 'date_inspection', 'appareil', 'emplacement', 'capacite', 'palan', 'manufacturier', 'model', 'serie', 'chaine', 'hauteur', 'charriot', 'commande_par', 'vp', 'vc', 'inscpecte_par
        const {id} = req.params;
        const query = `DELETE FROM soumission WHERE id = '${id}'`;
        client.query(   
            query,
            (err, result) => {
                console.log(err)    
                res.json(result);

            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// delete facture
router.delete('/factures/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  'num_facture', 'nom_client', 'adresse', 'date_inspection', 'appareil', 'emplacement', 'capacite', 'palan', 'manufacturier', 'model', 'serie', 'chaine', 'hauteur', 'charriot', 'commande_par', 'vp', 'vc', 'inscpecte_par
        const {id} = req.params;
        const query = `DELETE FROM facture WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );
            
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// delete certification

// get certification by id
router.get('/certifications/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  'num_facture', 'nom_client', 'adresse', 'date_inspection', 'appareil', 'emplacement', 'capacite', 'palan', 'manufacturier', 'model', 'serie', 'chaine', 'hauteur', 'charriot', 'commande_par', 'vp', 'vc', 'inscpecte_par
        const {id} = req.params;
        const query = `SELECT * FROM certification WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
                console.log(err)
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});


//put inspection
router.put('/inspections/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  'num_facture', 'nom_client', 'adresse', 'date_inspection', 'appareil', 'emplacement', 'capacite', 'palan', 'manufacturier', 'model', 'serie', 'chaine', 'hauteur', 'charriot', 'commande_par', 'vp', 'vc', 'inscpecte_par'
        const {id} = req.params;
        const {num_facture, nom_client, adresse, date_inspection, appareil, emplacement, capacite, palan, manufacturier, model, serie, chaine, hauteur, charriot, commande_par, vp, vc, inscpecte_par} = req.body;
        const query = `UPDATE inspections SET num_facture = '${num_facture}', nom_client = '${nom_client}', adresse = '${adresse}', date_inspection = '${date_inspection}', appareil = '${appareil}', emplacement = '${emplacement}', capacite = '${capacite}', palan = '${palan}', manufacturier = '${manufacturier}', model = '${model}', serie = '${serie}', chaine = '${chaine}', hauteur = '${hauteur}', charriot = '${charriot}', commande_par = '${commande_par}', vp = '${vp}', vc = '${vc}', inscpecte_par = '${inscpecte_par}' WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                if (err){
                    console.log(err)
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
            );

    } catch (e) {
        console.log(e)

        res.status(500).json({message: 'Something went wrong'});
    }
});
//put facture
router.put('/factures/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  adresse date_soumis facture_a site_web sous_total telephone total tps tvq
        const {id} = req.params;
        const {adresse, date_soumis, facture_a, site_web, sous_total, telephone, total, tps, tvq} = req.body;
        const query = `UPDATE facture SET adresse = '${adresse}', date_soumis = '${date_soumis}', facture_a = '${facture_a}', site_web = '${site_web}', sous_total = '${sous_total}', telephone = '${telephone}', total = '${total}', tps = '${tps}', tvq = '${tvq}' WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                if (err){
                    console.log(err)
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
            );

    } catch (e) {
        console.log(e)


        res.status(500).json({message: 'Something went wrong'});
    }
});

        
//get all inspections
router.get('/inspections', async (req, res) => {
    try {
        // select all from table users where id = userid and
        const query = `SELECT * FROM inspections`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
//get all factures
router.get('/factures', async (req, res) => {
    try {
        // select all from table users where id = userid and
        const query = `SELECT * FROM facture`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// get facture by id
router.get('/factures/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const query = `SELECT * FROM facture WHERE id = '${id}'`;
        client.query(
            query,(err, result) => {
                res.json(result);
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});

router.post('/facture', async (req, res) => {
    try {
        // insert into table users the values of columns :  adresse date_soumis facture_a site_web sous_total telephone total tps tvq
        const {adresse, date_soumis, facture_a, site_web, sous_total, telephone, total, tps, tvq} = req.body;
        const query = `INSERT INTO facture (adresse, date_soumis, facture_a, site_web, sous_total, telephone, total, tps, tvq) VALUES ('${adresse}', '${date_soumis}', '${facture_a}', '${site_web}', '${sous_total}', '${telephone}', '${total}', '${tps}', '${tvq}')`;

        client.query(
            query,
            (err, result) => {
                if (err){
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
          );
        
    } catch (e) {
        console.log(e)

        res.status(500).json({message: 'Something went wrong'});
    }
});
router.post('/soumissions', async (req, res) => {
    try {
        // insert into table users the values of columns :  adresse company contact id sujet tel
        const {adresse, company, contact,  sujet, tel} = req.body;
        const query = `INSERT INTO soumission (adresse, company, contact,  sujet, tel) VALUES ('${adresse}', '${company}', '${contact}', '${sujet}', '${tel}')`;
        
        client.query(
            query,
            (err, result) => {
                if (err){
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
          );
        
    } catch (e) {
        console.log(e)

        res.status(500).json({message: 'Something went wrong'});
    }
});
//put soumission
router.put('/soumissions/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  adresse company contact id sujet tel
        const {id} = req.params;
        const {adresse, company, contact,  sujet, tel} = req.body;
        const query = `UPDATE soumission SET adresse = '${adresse}', company = '${company}', contact = '${contact}', sujet = '${sujet}', tel = '${tel}' WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                if (err){
                    console.log(err)
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
            );

    } catch (e) {
        console.log(e)


        res.status(500).json({message: 'Something went wrong'});
    }

});

// get all soumissions
router.get('/soumissions', async (req, res) => {
    try {
        // select all from table users where id = userid and
        const query = `SELECT * FROM soumission`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// get soumission by id
router.get('/soumissions/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const query = `SELECT * FROM soumission WHERE id = '${id}'`;
        client.query(
            query,(err, result) => {
                res.json(result);
            }
            );
        }
        catch (e) {
            res.status(500).json({message: 'Something went wrong'});
        }
    });
    
// get all certification
router.get('/certifications', async (req, res) => {
    try {
        // select all from table users where id = userid and
        const query = `SELECT * FROM certification`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// delete certification
router.delete('/certifications/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const query = `DELETE FROM certification WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );

    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});

            
router.post('/certifications', async (req, res) => {
    try {
        // insert into table users the values of columns :  'inspection_date', 'company_usage', 'equipement', 'capacity', 'equipement_details', 'expiry', 'no_de_cert', 'responsable'
        const {inspection_date, company_usage, equipement, capacity, equipement_details, expiry, no_de_cert, responsable} = req.body;
        const query = `INSERT INTO certification (inspection_date, company_usage, equipement, capacity, equipement_details, expiry, no_de_cert, responsable) VALUES ('${inspection_date}', '${company_usage}', '${equipement}', '${capacity}', '${equipement_details}', '${expiry}', '${no_de_cert}', '${responsable}')`;
        client.query(
            query,
            (err, result) => {
                if (err){
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
          );
        
    } catch (e) {
        console.log(e)

        res.status(500).json({message: 'Something went wrong'});
    }
});

//put certification
router.put('/certifications/:id', async (req, res) => {
    try {
                // insert into table users the values of columns :  'inspection_date', 'company_usage', 'equipement', 'capacity', 'equipement_details', 'expiry', 'no_de_cert', 'responsable'
                const {id} = req.params;
                const {inspection_date, company_usage, equipement, capacity, equipement_details, expiry, no_de_cert, responsable} = req.body;
                const query = `UPDATE certification SET inspection_date = '${inspection_date}', company_usage = '${company_usage}', equipement = '${equipement}', capacity = '${capacity}', equipement_details = '${equipement_details}', expiry = '${expiry}', no_de_cert = '${no_de_cert}', responsable = '${responsable}' WHERE id = '${id}'`;
                client.query(
                    query,
                    (err, result) => {
                        if (err){
                            console.log(err)
                            res.status(500).json({message: 'Wrong Data'});
                        }
                        res.json(result);
                    }
                    );

    } catch (e) {
        console.log(e)
    }
});

router.delete('/client/:userid', async (req, res) => {
    try {
        // delete from table users where id = userid
        const {userid} = req.params;
        const query = `DELETE FROM users WHERE id = '${userid}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});

router.put('/client/:userid', async (req, res) => {
    try {
        // update table users where id = userid
        const {userid} = req.params;
        const {fullname, email, pwd, current_balance, funds_on_hold, withdrawable_balance ,date_of_birth, country,company_name,contact_information} = req.body;
        const query = `UPDATE users SET fullname = '${fullname}', email = '${email}', pwd = '${pwd}', current_balance = '${current_balance}', funds_on_hold = '${funds_on_hold}', withdrawable_balance = '${withdrawable_balance}' ,date_of_birth = '${date_of_birth}', country = '${country}', company_name = '${company_name}', contact_information = '${contact_information}' WHERE id = '${userid}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
                console.log(err)
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// get all from facture_item where :id = id_facture
router.get('/facture_item/:id', async (req, res) => {
    try {
        // select all from table users where id = userid and
        const {id} = req.params;
        const query = `SELECT * FROM facture_item WHERE id_facture = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            )   }
            catch (e) {
                res.status(500).json({message: 'Something went wrong'});
            }
        });
// post to facture_item   descrip varchar(255), unit varchar(255), prix varchar(255), id_facture int
router.post('/facture_item/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  'inspection_date', 'company_usage', 'equipement', 'capacity', 'equipement_details', 'expiry', 'no_de_cert', 'responsable'
        const {id} = req.params;
        const {descrip, unit, prix} = req.body;
        const query = `INSERT INTO facture_item (descrip, unit, prix, id_facture) VALUES ('${descrip}', '${unit}', '${prix}', '${id}')`;
        client.query(
            query,
            (err, result) => {
                console.log(err)
                if (err){
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
            );

    } catch (e) {
        console.log(e)}
    })
// delete facture_item
router.delete('/facture_item/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const query = `DELETE FROM facture_item WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// put facture_item
router.put('/facture_item/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {descrip, unit, prix} = req.body;
        const query = `UPDATE facture_item SET descrip = '${descrip}', unit = '${unit}', prix = '${prix}' WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});

// get last facture item id and add 1
router.get('/last-facture-item', async (req, res) => {
    try {
        const query = `SELECT id FROM facture_item ORDER BY id DESC LIMIT 1`;
        client.query(
            query,
            (err, result) => {
                if(result.length == 0){
                    const query2 ="ALTER TABLE facture_item AUTO_INCREMENT = 1"
                    client.query(
                        query2,
                        (err, result) => {
                            console.log(err)
                            res.json([{id: 1}]);
                        }
                        );
                }
                else{
                    console.log(err)
                    res.json(result);
                }
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});
// get last facture

// get last inspection id and add 1
router.get('/last-inspection', async (req, res) => {
    try {
        const query = `SELECT id FROM inspections ORDER BY id DESC LIMIT 1`;
        client.query(
            query,
            (err, result) => {
                if(result.length == 0){
                    const query2 ="ALTER TABLE inspections AUTO_INCREMENT = 1"
                    client.query(
                        query2,
                        (err, result) => {
                            console.log(err)
                            res.json([{id: 1}]);
                        }
                        );
                }
                else{
                    console.log(err)
                    res.json(result);
                }
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});


router.get('/last-facture', async (req, res) => {
    try {
        const query = `SELECT id FROM facture ORDER BY id DESC LIMIT 1`;
        client.query(
            query,
            (err, result) => {
                if(result.length == 0){
                    const query2 ="ALTER TABLE facture AUTO_INCREMENT = 1"
                    client.query(
                        query2,
                        (err, result) => {
                            console.log(err)
                            res.json([{id: 1}]);
                        }
                        );
                }
                else{
                    console.log(err)
                    res.json(result);
                }
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});


// get all inscpetion_item where :id = id_inscpection
router.get('/inspection_item/:id', async (req, res) => {
    try {
        // select all from table users where id = userid and
        const {id} = req.params;
        const query = `SELECT * FROM inspection_item WHERE inspections_id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                console.log(err)
                res.json(result);
            }
            )   }
            catch (e) {
                res.status(500).json({message: 'Something went wrong'});
            }
        });
// post to inspection_item    nom varchar(255), palan bool, chariot bool, pont bool ,img varchar(255), inspections_id as params
router.post('/inscpection_item/:id', async (req, res) => {
    try {
        // insert into table users the values of columns :  'inspection_date', 'company_usage', 'equipement', 'capacity', 'equipement_details', 'expiry', 'no_de_cert', 'responsable'
        const {id} = req.params;
        const {nom, palan, chariot, pont, img} = req.body;
        const query = `INSERT INTO inspection_item (nom, palan, chariot, pont, img, inspections_id) VALUES ('${nom}', '${palan}', '${chariot}', '${pont}', '${img}', '${id}')`;
        client.query(
            query,
            (err, result) => {
                console.log(err)
                console.log(result)
                if (err){
                    res.status(500).json({message: 'Wrong Data'});
                }
                res.json(result);
            }
            );
        }
        catch (e) {
            console.log(e)}
        })
// delete inspection_item
router.delete('/inscpection_item/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const query = `DELETE FROM inspection_item WHERE id = '${id}'`;
        client.query(
            query,
            (err, result) => {
                res.json(result);
            }
            );
    } catch (e) {
        res.status(500).json({message: 'Something went wrong'});
    }
});


module.exports = router;

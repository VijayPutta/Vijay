const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @route  GET api/auth
// desc    Test route
// @access Public
// @route  POST api/users
// desc    Register user
// @access Public

const User = require('../../models/User');

router.post('/',

    //validation for the user name, email and password
    [
    check('email','Please include a valid email').isEmail(),
    check(
        'password',
        'Password is required'
    ).exists()],



    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            })
        }

    const { email, password} = req.body;

    try{
        //Get the user and compare whether the user exist or not

        let user = await User.findOne({email});

        if(!user){
          return  res.status(400).json({errors :[{msg: 'Invalid credentials'}]});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return  res
            .status(400)
            .json({errors :[{msg: 'Invalid credentials'}]});
        }
        
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 3600000},
        (err,token) => {
            if(err) throw err;
            res.json({token});
        });

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
       
    
});
router.get('/',auth, async (req,res) => 
    {
        try{
            const user =  await User.findById(req.user.id)
            // commented for now, need password to be hided
            //.select('-password');
            res.json(user);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });

module.exports = router;
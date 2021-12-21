const express = require('express');
const User = require('../models/userModel');
const auth = require('../middleware/auth')
const router = new express.Router();

router.post('/users', async (req,res)=>{

  const user = new User(req.body)

  try {
       await user.save();
       const token = await user.generateAuthToken()
      res.status(201).send({user,token})
  } catch (e) {
    res.status(500).send(e)
  }
});

router.post('/users/login',async (req,res)=>{
  
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
  res.status(200).send({user,token})
  } catch (e) {
    res.status(400).send(e)
  }
})
router.post('/users/logout',auth,async (req,res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token !==  req.token
    })
    await req.user.save();
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})

router.post('/users/logoutAll',auth,async (req,res) => {
  try {
     req.user.tokens = []
     await req.user.save();
    res.send()
    
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/users/me', auth ,async (req,res)=>{
    res.send(req.user)
});

router.get('/users',auth ,async (req,res)=>{
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (e) {
    res.status(404).send(e)
  }
});

router.get('/users/:id',async (req,res)=>{
  
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
         res.status(404).send()
         }
         res.send(user)
    } catch (e) {
      res.status(500).send(e)
    }
});

router.patch('/users/me',auth ,async (req,res)=>{
  const updates = Object.keys(req.body);
  const allowUpdate = ['name', 'age', 'password', 'email']
  const validOperation = updates.every((update) => allowUpdate.includes(update))
  if (!validOperation) {
    res.status(400).send({error:'invalid updates'})
  }
  
  try {
    updates.forEach((update)=>req.user[update] = req.body[update])
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
    await req.user.save()
      if (!req.user) {
        res.status(404).send()
      }
      res.send(req.user)
    } catch (e) {
      res.status(500).send(e)
    }
});

router.delete('/users/me',auth,async(req,res)=>{
  try {
      await req.user.remove()
          res.status(200).send(req.user)
  } catch (e) {
      res.status(500).send(e)
  }
});

module.exports = router
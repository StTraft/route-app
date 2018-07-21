process.env.NODE_ENV = 'test'

import chai from 'chai'
import sinon from 'sinon'

import fetchResult from '../src/fetchResult'
import redisStore from '../src/redisStore'

const should    = chai.should()
const expect    = chai.expect
const token     = '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e'

describe('fetchResult behaviours', () => {
  let req, res, redisStoreStub
  beforeEach( () => {
    req = {
      params: token
    }
    res = {
      setHeader: () => {},
      send: data => data
    }
    redisStoreStub = sinon.stub(redisStore, 'getData') 
  })
  afterEach(() => {
    redisStoreStub.restore()
  })

  it('return error if no records found', done => {

    let errMessage = 'error message'

    redisStoreStub.throws({message: errMessage})

    fetchResult(req, res)
      .then(data => {
        data.should.be.a('object')
        data.should.have.property('error').eq(errMessage)
        data.should.have.property('status').eq('failure')
        done()
      })
  })

  it('return in progress if record is waiting google api', done => {
    
    redisStoreStub.resolves({status: 'in progress'})

    fetchResult(req, res)
      .then(data => {
        data.should.be.a('object')
        data.should.have.property('status').eq('in progress')
        done()
      })
  })

  it('return success if record is found and got data from google api', done => {

    redisStoreStub.resolves({
      status: 'success',
      path: [
        ['lat', 'long'],
        ['lat', 'long'],
        ['lat', 'long']
      ],
      total_distance: 10,
      total_time: 10,
    })

    fetchResult(req, res)
      .then(data => {
        data.should.be.a('object')
        data.should.have.property('status').eq('success')
        data.should.have.property('path').be.a('array')
        data.should.have.property('total_distance')
        data.should.have.property('total_time')
        done()
      })
  })
})

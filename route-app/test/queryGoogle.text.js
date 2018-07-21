process.env.NODE_ENV = 'test'

import chai from 'chai'
import sinon from 'sinon'
import request from 'request-promise'

import queryGoogle from '../src/queryGoogle'
import redisStore from '../src/redisStore'

const should    = chai.should()
const expect    = chai.expect

describe('queryGoogle behaviours', () => {
  const token = 'fake-token'
  let req, res,
    requestStub,
    redisStoreStub

  beforeEach(() => {
    req = {
      body: {}
    }
    res = {
      setHeader: () => {},
      send: sinon.spy()
    }
    requestStub = sinon.stub(request, 'get').resolves({api: 'success'})
    redisStoreStub = sinon.stub(redisStore, 'setData').returns(token)
  })

  afterEach(() => {
    requestStub.restore()
    redisStoreStub.restore()
  })

  it('return a token on success if 2 set of lat-long is input', () => {
    
    req.body = [
      ['10.0', '10.0'],
      ['10.0', '10.0']
    ]

    queryGoogle(req, res)

    expect(res.send.calledOnce).to.be.true

    let returnData = res.send.firstCall.args[0]

    returnData.should.be.a('object')
    returnData.should.have.property('token').eq(token)
  })

  it('return a token on success if more than 2 set of lat-long is input', () => {
    
    req.body = [
      ['10.0', '10.0'],
      ['10.0', '10.0'],
      ['10.0', '10.0'],
      ['10.0', '10.0'],
      ['10.0', '10.0']
    ]

    queryGoogle(req, res)

    expect(res.send.calledOnce).to.be.true

    let returnData = res.send.firstCall.args[0]

    returnData.should.be.a('object')
    returnData.should.have.property('token').eq(token)
  })

  it('return error if input data format is incorrect', () => {

    req.body = {data: 'wrong'}

    queryGoogle(req, res)

    expect(res.send.calledOnce).to.be.true
    
    let returnData = res.send.firstCall.args[0]
    returnData.should.be.a('object')
    returnData.should.have.property('error')
  })

  it('return error if input path array contain only 1 lat-long set', () => {

    req.body = [
      ['10.0', '10.0']
    ]

    queryGoogle(req, res)

    expect(res.send.calledOnce).to.be.true

    let returnData = res.send.firstCall.args[0]
    returnData.should.be.a('object')
    returnData.should.have.property('error')
  })

  it('return error if input path lat-long set has elements more than 2', () => {
    
    req.body = [
      ['10.0', '10.0', '10.0'],
      ['10.0', '10.0', '10.0']
    ]

    queryGoogle(req, res)

    expect(res.send.calledOnce).to.be.true

    let returnData = res.send.firstCall.args[0]
    returnData.should.be.a('object')
    returnData.should.have.property('error')
  })

  it('return error if input path lat-long set has elements less than 2', () => {
    
    req.body = [
      ['10.0'],
      ['10.0']
    ]

    queryGoogle(req, res)

    expect(res.send.calledOnce).to.be.true

    let returnData = res.send.firstCall.args[0]
    returnData.should.be.a('object')
    returnData.should.have.property('error')
  })

  it('return error if input path lat-long set cannot parse to float', () => {
    
    req.body = [
      ['foo', 'foo'],
      ['foo', 'foo']
    ]

    queryGoogle(req, res)

    expect(res.send.calledOnce).to.be.true

    let returnData = res.send.firstCall.args[0]
    returnData.should.be.a('object')
    returnData.should.have.property('error')
  })
})


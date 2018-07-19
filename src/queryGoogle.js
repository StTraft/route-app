import request from 'request-promise'

export default async function queryGoogle(req, res) {
  let string = await request.get('https://google.com').then(htmlString => htmlString.slice(0, 20))
  console.log('string in internal queryGoogle:', string)
  res.send(string)
  return string
}

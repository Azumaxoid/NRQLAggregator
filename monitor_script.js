/***
 * データ収集に必要な設定
 ***/
// データを収取するアカウントのID
const accountId = 3338940;
// New Relicの情報を汎用的に収集できるNerdGraphを利用します。これはユーザーに結びつくキーです。
// ない場合は、https://one.newrelic.com/admin-portal/api-keys/home で作成してください。
const userKey = $secure.NR_USER_KEY
// データを収集するためのNRQLです。収集したデータを利用しやすくするために、'as ***'というエイリアスをつけてください。
// FACETで指定した値を属性情報として追加したい場合、SELECT区にlatest()で同じ属性を追加してください。
const nrql = 'SELECT count(*) as cnt, latest(appName) as appName, latest(name) as name FROM Transaction  FACET appName, name SINCE 1 hours ago'

/***
 * 集約データを保存するために必要な設定
 ***/
// データを保存するアカウントのID. データ収集を行うアカウントと同じにしていますが、変更しても良いです。
const destAccountId = accountId;
// destAccountIdのアカウントへ保存するためのKeyが必要です。
// ない場合は、https://insights.newrelic.com/accounts/{あなたのアカウントID}/manage/api_keys　でinsert keyを作成してください。
const ingestKey = $secure.NR_INSIGHTS_KEY
// データ保存先のイベントタイプ名
const eventType = 'SampleEvent'

var assert = require('assert');
// Get repositories
var http = {
  getJson: (url)=> new Promise(r=>$http.get(url,  { headers: { 'Content-Type': 'application/json' , 'User-Agent': 'nr-github-integration'}, responseType: 'json'}, function (err, response, body) {
    assert.equal(response.statusCode, 200, 'Expected a 200 OK response');
    r(JSON.parse(body));
  })),
  nrql: (accountId, NRQL) => {
    return new Promise((res, rev)=> {
      $http.post('https://api.newrelic.com/graphql',{
        json: {query: `{actor{account(id: ${accountId}) {nrql(query: "${NRQL}") {results}}}}`},
        headers: {'Content-Type': 'application/json','API-Key': userKey}
      }, (err, response, body) => {
        assert.equal(response.statusCode, 200, 'Expected a 200 OK response')
        if (err || body.errors) {
          console.error(body.errors.message);
          assert.fail(`NRQL get data request was failed : (${NRQL})`);
        }
        res(body);
      });
    });
  },
  storeEvent: (accountId, data) => {
    return new Promise((res, rev) => {
      $http.post(`https://insights-collector.newrelic.com/v1/accounts/${accountId}/events`,
        {  json: data, headers: {   'Content-Type': 'application/json', 'API-Key': ingestKey } },
        (err, response, body) => {
        if (err) {
          assert.fail('Metrics post request was failed');
        }
        res(body);
      });
    });
  }
};

async function run() {
  var stored = await http.nrql(accountId, nrql);
  console.log(stored)
  const events = stored.data.actor.account.nrql.results.map(result =>{
    const newEvent = { eventType }
    Object.entries(result).filter(entry => entry[0] !== 'facet').forEach(entry => newEvent[entry[0]] = entry[1])
    return newEvent
  })
  http.storeEvent(accountId, events);
  $util.insights.set('storedEvents', events.length);
}

run();

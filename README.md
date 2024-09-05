# 利用方法
1. Syntheticsの「Secure credentials」メニューを開く
1. 「Create secure credential」を使って２つのCredentialを登録
   * NR_USER_KEY : データを取得するためのユーザーキー [こちらで取得](https://one.newrelic.com/admin-portal/api-keys/home)
   * NR_INSIGHTS_KEY : データを保存するためのキー [こちらで取得](https://one.newrelic.com/admin-portal/api-keys/insightkeys)
1. 「Monitor」メニューを開く
1. 「Create monitor」を使って「Endpoint availability / Scripted API」のモニタを作成
1. Nameを入力。Periodは集計間隔に合わせる。
1. 「Select locations」を押す
1. 一つ選択。"Tokyo"ではなく "Portland"や"San Francisco"などを選ぶ
1. 「Write script」を押す
1. このリポジトリのmonitor_script.jsのコードをコピーし、貼り付ける
1. "accountId"、"nrql", "eventType"を適切に変更
1. 実行して確認
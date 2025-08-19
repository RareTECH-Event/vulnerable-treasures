import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const challengeDescriptions: { [key: string]: string } = {
  'Tutorial': '最初のチュートリアルです。以下のフラグをコピーして「Challenges」ページでSubmitしてください: CTF{W3lc0me_T0_Vulnerable_Treasures}',
  'SQL Injection - Auth Bypass': 'ログインフォームのクエリ組み立てが脆弱です。SQLインジェクションで認証をバイパスし、ダッシュボードでフラグを表示させてください。',
  'SQL Injection - Information Leakage': '製品検索のクエリが脆弱です。UNIONベースのSQLインジェクションでadminのパスワードを結果に混ぜ、正規ログインで別のフラグを取得してください。',
  'Stored XSS': '製品ページのコメントセクションは、ユーザー入力を適切にサニタイズしていません。ページを訪れるすべてのユーザーで実行される永続的なスクリプトを注入してください。',
  'Reflected XSS': '検索語がエスケープされずに製品検索ページに反映されます。クリックしたユーザーのブラウザでスクリプトを実行するURLを作成してください。',
  'IDOR': "ユーザープロファイルはURLのIDを介してアクセス可能ですが、サーバーは認可をチェックしていません。adminのプロファイルページにアクセスしてフラグを見つけてください。",
  'Path Traversal': 'ファイルダウンロード機能は、意図したディレクトリ外のファイルにアクセスするように操作できます。アプリの隠しディレクトリにあるファイルの内容を読み取ってください。',
  'Command Injection': 'ネットワークのpingユーティリティは、ユーザーが指定した入力でシェルコマンドを実行します。アプリの隠しディレクトリ内のファイルを出力させる追加コマンドを注入してください。',
  'XXE': 'XMLパーサーが外部エンティティを処理するように誤って設定されており、これを利用してサーバー上のローカルファイルを読み取ることができます。',
  'Brute Force': 'ユーザー "alice" は、よく使われる弱いパスワードを持っています。ログインページでブルートフォース攻撃を行い、彼女の認証情報を見つけてください。',
  'Admin Password': 'UNIONによってadminのパスワードを検索結果に可視化し、そのパスワードでログインしてフラグを取得してください。',
  'Crawler Footprints': '検索エンジンのクローラが最初に参照するページを確認し、そこに隠されたフラグを見つけてください。',
  'SSRF': 'サーバが任意のURLを取得するプロキシを悪用して、内部APIからフラグを取得してください。ヒント: ネットワーク関連のページから手がかりを探してみましょう。',
};

export async function GET() {
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });
  try {
    const flags = db.prepare("SELECT id, name, is_captured FROM flags").all();
    const challenges = flags.map(flag => ({
      id: flag.id,
      title: flag.name,
      description: challengeDescriptions[flag.name] || 'No description available.',
      captured: !!flag.is_captured,
    }));
    return NextResponse.json(challenges);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}

'use client';

import Link from "next/link";
import { Card } from "react-bootstrap";

export default function Home() {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">Vulnerable Treasuresへようこそ！</Card.Title>
        <Card.Text>
          これは、Webセキュリティを学ぶために意図的に脆弱性を持たせたWebアプリケーションです。
        </Card.Text>
        <Card.Text>
          あなたの目標は、脆弱性を見つけて悪用し、隠されたフラグ（宝物）を獲得することです。
        </Card.Text>
        <Card.Text>
          <Link href="/challenges" className="text-primary">チャレンジ一覧</Link> ページで、挑戦可能な問題を確認し、宝探しを始めましょう！
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

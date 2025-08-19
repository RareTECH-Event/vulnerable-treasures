# Vulnerable Treasures - A CTF Web Application

Vulnerable Treasures is an intentionally vulnerable web application designed for learning and practicing web security. It simulates a fictional e-commerce site for ancient treasures, but it's riddled with security holes for you to discover.

The goal is to find and exploit these vulnerabilities to capture flags. Each flag has the format `CTF{...}`.

## How to use

このアプリは学習用に意図的な脆弱性を含んでいます。ゴールは画面やAPIのレスポンスに現れる `CTF{...}` を集めることです。インターネットに公開せず、手元の環境で実行してください。

### 使い方（Docker）

- ローカルでビルドして起動
  - ビルド: `docker build -t vulnerable-treasures .`
  - 起動: `docker run -d --name vt -p 3000:3000 vulnerable-treasures:latest`
  - 停止/リセット: `docker rm -f vt`

### Challenge Overview

- Tutorial
- SQL Injection — Auth Bypass
- SQL Injection — Information Leakage
- Reflected XSS
- Stored XSS
- IDOR
- Path Traversal
- Command Injection
- XXE
- SSRF
- Crawler Footprints
- Brute Force
- Admin Password

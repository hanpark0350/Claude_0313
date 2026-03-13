#!/bin/bash
# Claude Code - Antigravity 터미널 환경 설정 스크립트
#
# 문제: cmd에서는 Claude Code가 열리지만 antigravity 터미널에서는 안 열리는 이유
#
# 원인:
#   - Claude Code는 /opt/node22/bin/claude 에 설치됨
#   - /etc/profile.d/nodejs.sh 에서 PATH에 /opt/node22/bin 을 추가하지만
#     이 스크립트는 '로그인 셸(login shell)'에서만 실행됨
#   - antigravity 터미널은 non-login shell로 시작하기 때문에
#     /etc/profile 및 /etc/profile.d/ 스크립트가 실행되지 않음
#   - 결과적으로 PATH에 /opt/node22/bin 이 포함되지 않아 claude 명령어를 찾지 못함
#
# 해결책:
#   /usr/local/bin (모든 셸 환경에서 PATH에 포함) 에 심볼릭 링크 생성

echo "Claude Code 심볼릭 링크 설정 중..."

if [ ! -f /usr/local/bin/claude ]; then
    ln -sf /opt/claude-code/bin/claude /usr/local/bin/claude
    echo "완료: /usr/local/bin/claude -> /opt/claude-code/bin/claude"
else
    echo "이미 설정되어 있습니다: $(ls -la /usr/local/bin/claude)"
fi

echo ""
echo "Claude Code 버전 확인:"
claude --version

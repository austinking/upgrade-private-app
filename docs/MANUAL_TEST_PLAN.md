# Manual Test Plan

cat /dev/null > ~/local/bin/sekrit-app
chmod +x ~/local/bin/sekrit-app

1) no credentials
2) bad token
3) good token
4) No, don't persist

1) no credentials
2) should be prompted for credentials

1) no credentials
2) bad token
3) good token
4) Yes, persist

1) re-uses good credentials

1) edit ~/.upgrade_private_app_token to make bad credentials
2) good token
3) Yes, persist


#var/www/html
pnpm run build export NEXT_PUBLIC_API_TARGET=prod
sftp net:/var/www/nuon << EOF
rm -R *
put -r ./out/* ./
EOF
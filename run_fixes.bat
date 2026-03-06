@echo off
node update_scripts.js > my_log.txt 2>&1
echo DONE >> my_log.txt
python update_perms.py >> my_log.txt 2>&1
echo DONE PYTHON >> my_log.txt

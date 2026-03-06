import json
import os
import re

perms_path = os.path.join('d:\\', 'Akalp', 'Saas', 'JanUmangSaas', 'shared', 'permissions.json')
with open(perms_path, 'r') as f:
    perms = json.load(f)

modules_path = os.path.join('d:\\', 'Akalp', 'Saas', 'JanUmangSaas', 'Server', 'src', 'config', 'modules.js')
with open(modules_path, 'r') as f:
    modules_content = f.read()

if "const PERMISSIONS = require" not in modules_content:
    modules_content = "const PERMISSIONS = require('../../../shared/permissions.json');\n" + modules_content

for key, val in perms.items():
    modules_content = re.sub(f'"{val}"', f'PERMISSIONS.{key}', modules_content)

with open(modules_path, 'w') as f:
    f.write(modules_content)
print("Updated modules.js")

menu_path = os.path.join('d:\\', 'Akalp', 'Saas', 'JanUmangSaas', 'adminlte-3-react-main', 'src', 'utils', 'menu.ts')
with open(menu_path, 'r') as f:
    menu_content = f.read()

if "PERMISSIONS } from '@app/config/permissions'" not in menu_content:
    menu_content = "import { PERMISSIONS } from '@app/config/permissions';\n" + menu_content

for key, val in perms.items():
    menu_content = re.sub(f'"{val}"', f'PERMISSIONS.{key}', menu_content)

with open(menu_path, 'w') as f:
    f.write(menu_content)

print("Updated menu.ts")

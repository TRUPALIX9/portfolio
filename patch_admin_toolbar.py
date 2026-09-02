import re

with open('src/components/admin/MasterVisitorExplorer.tsx', 'r') as f:
    content = f.read()

old_toolbar = r'\{\/\* Toolbar \*\/\}.*?<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">.*?</div>\s*</div>'

# I will write a regex block replace for the toolbar section

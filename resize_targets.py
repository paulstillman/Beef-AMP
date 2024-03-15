# resizing python images

from PIL import Image
import os, sys
from os.path import isfile, join
from os import listdir

import glob
root_dir='./img/targets'

onlyfiles = [f for f in listdir(root_dir) if isfile(join(root_dir, f))]

p1 = Image.open(f'./img/targets/{onlyfiles[0]}')
imResize = p1.resize((480,480), Image.ANTIALIAS)


for filename in onlyfiles:
    print(filename)
    im = Image.open(f'./img/targets/{filename}')
    imResize = im.resize((480,480), Image.ANTIALIAS)
    imResize.save(f'./img/targets_resized/{filename}', 'PNG', quality=95)

from __future__ import print_function

import re
import gzip
from datetime import datetime, timedelta
from ipaddress import ip_address, ip_network
import os.path

PATH_TO_FILES = "./"

LOG_FILES = [
    "dan", "mirror", "access"
]

DATE_REGEX = re.compile(r'\[([^]]*)\]')
PATH_REGEX = re.compile(r'"GET ([^\s]*)')
NOT_FOUND_REGEX = re.compile(r'"GET[^"]*" 404 ')

NUS_IPS = [
    ip_network('172.16.0.0/12'),
    ip_network('137.132.0.0/16'),
]


def should_check(line):
    return not NOT_FOUND_REGEX.search(line)


def check_if_nus(ip):
    for network in NUS_IPS:
        if ip in network:
            return True
    return False


class AccessInfo():
    def __init__(self, is_nus, date, path):
        self.is_nus = is_nus
        self.date = date
        self.path = path

    def __repr__(self):
        return str((self.is_nus, self.date, self.path))


def get_filenames(base_name):
    yield base_name
    ind = 1
    while True:
        yield base_name + "." + str(ind) + ".gz"
        ind += 1

def get_lines(base_name):
    def open_gz(filename):
        return gzip.open(filename)

    def open_txt(filename):
        return open(filename)

    for file_name in get_filenames(base_name):
        if not os.path.isfile(file_name):
            break

        if file_name.endswith('.gz'):
            open_func = open_gz
            decoded = False
        else:
            open_func = open_txt
            decoded = True
        with open_func(file_name) as fin:
            for line in reversed(list(fin)):
                if not decoded:
                    try:
                        line = line.decode('utf-8')
                    except:
                        line = None
                if line:
                    yield line


def line_to_info(line):
    ip = ip_address(line.split(' ')[0])
    if not ip:
        return None
    date = DATE_REGEX.search(line)
    if date:
        date = date.group(1)
        date = datetime.strptime(date, "%d/%b/%Y:%H:%M:%S +0800").replace(tzinfo=None)
    else:
        return None
    path = PATH_REGEX.search(line)
    if path:
        path = path.group(1)
    else:
        return None
    return AccessInfo(check_if_nus(ip), date, path)


def get_info(base_name, end_date):
    for l in get_lines(base_name):
        if l and should_check(l):
            line_info = line_to_info(l)
            if not line_info:
                continue
            if line_info.date < end_date:
                break
            yield line_info

def main():
    counter = {}
    is_nus = 0
    total = 0
    last_day = datetime.now() - timedelta(hours=24 * 2)
    ind = 0

    def get_all_info():
        for f in LOG_FILES:
            for l in get_info('/var/log/nginx/' + f + '.log', last_day):
                yield l

    for l in get_all_info():
        total += 1
        # print(ind)
        ind += 1
        top_path = "/".join(l.path.split('/')[:3])
        counter[top_path] = counter.get(top_path, 0) + 1
        if l.is_nus:
            is_nus += 1

    print(is_nus, total)
    print(sorted([(-v, k) for k, v in counter.items()])[:10])

main()

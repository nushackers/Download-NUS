#!/bin/sh

# Usage: name host ['common opts'] ['1st run opts'] ['2nd run opts'] ...

if test "$#" -lt 2; then
  echo "too little arguments!"
  exit 1
fi

RSYNC=rsync
NAME="$1"; shift
HOST="rsync://$1"; shift

if test "$#" -eq 1; then
  # no stage 1, only common
  set -- "$1" ''
elif test "$#" -eq 0; then
  # no common
  set -- '' ''
fi

COMMON_OPTS="$1"; shift

BASEDIR=/var/www/download
CONTENTLOG=$BASEDIR/log/$NAME
MAINLOG=$BASEDIR/mirror.log

_log() {
  level="$1"; shift
  printf >>$MAINLOG "`date +'%Y/%m/%d %T'` $NAME [$level] $1\n"
}

log_info() { _log 'info' "$*"; }
log_error() { _log 'error' "$*"; }

LOCKFILE=$BASEDIR/$NAME.lock

if [ -e $LOCKFILE ]; then
  log_error 'sync in progress? stopping'
  exit 1
fi

touch $LOCKFILE

die() {
  /bin/rm $LOCKFILE
  log_info 'sync done'
}
trap 'die' EXIT

PROGRESSFILE=$BASEDIR/progress/$NAME
DATADIR=$BASEDIR/data/$NAME/

log_info "sync started"
stage=1
stage_total=$#
log_stage_info() { log_info "[$stage/$stage_total] $*"; }
log_stage_error() { log_error "[$stage/$stage_total] $*"; }

while test "$#" -ne 0; do
  opts="$1"; shift
  args="$COMMON_OPTS $opts --log-file=$CONTENTLOG $HOST $DATADIR --progress -v >$PROGRESSFILE"
  log_stage_info "started"
  eval </dev/null >>$MAINLOG 2>&1 "$RSYNC $args"
  code="$?"
  if [ "$code" = 0 ]; then
    log_stage_info "done"
  else
    log_stage_error "failed with '$code'; args were '$args'"
    exit 1
  fi
  stage=$(($stage + 1))
done

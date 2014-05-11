module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn(
      'Users',
      'level',
      DataTypes.INTEGER
    );
    done()
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.removeColumn(
      'Users',
      'level',
      DataTypes.INTEGER
    );
    done()
  }
}

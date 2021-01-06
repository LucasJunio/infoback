module.exports = {
  apps : [{
    name: 'start-info',
    script: 'start.js',
    // watch: '.',
    exec_mode: 'cluster_mode',
    node_args: '--expose-gc',
    env: {'PORT': 3001},
    instances: 'max',
    // instances: 3
  }]
}

def label = "worker-${UUID.randomUUID().toString()}"

podTemplate(label: label, containers: [
  containerTemplate(name: 'docker', image: 'docker', ttyEnabled: true, command: 'cat'),
  containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:v1.8.0', command: 'cat', ttyEnabled: true),
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock'),
  hostPathVolume(mountPath: '/app', hostPath: '/'),
]) {
  node(label) {
    def gateway
    def bitcoinRpc
    def ethereumRpc
    def bitcoinListener
    def ethereumListener

    def myRepo = checkout scm
    def gitCommit = myRepo.GIT_COMMIT
    def gitBranch = myRepo.GIT_BRANCH
    def shortGitCommit = "${gitCommit[0..10]}"
    def previousGitCommit = sh(script: "git rev-parse ${gitCommit}~", returnStdout: true)
    def registry = "registry.trustedlife.app"

    def gatewayImageName = "apiscore-gateway"
    def gatewayImage = "${registry}/${gatewayImageName}"

    def bitcoinRpcImageName = "apiscore-bitcoin-rpc"
    def bitcoinRpcImage = "${registry}/${bitcoinRpcImageName}"

    def ethereumRpcImageName = "apiscore-ethereum-rpc"
    def ethereumRpcImage = "${registry}/${ethereumRpcImageName}"

    def bitcoinListenerImageName = "apiscore-bitcoin-listener"
    def bitcoinListenerImage = "${registry}/${bitcoinListenerImageName}"

    def ethereumListenerImageName = "apiscore-ethereum-listener"
    def ethereumListenerImage = "${registry}/${ethereumListenerImageName}"

    container('docker') {
      stage('Build') {
        checkout scm
        gateway = docker.build("${gatewayImage}", "-f gateway/src/Dockerfile .")
        bitcoinRpc = docker.build("${bitcoinRpcImage}", "-f bitcoin-rpc/src/Dockerfile .")
        bitcoinListener = docker.build("${bitcoinListenerImage}", "-f bitcoin-listener/src/Dockerfile .")
        ethereumRpc = docker.build("${ethereumRpcImage}", "-f ethereum-rpc/src/Dockerfile .")
        ethereumListener = docker.build("${ethereumListenerImage}", "-f ethereum-listener/src/Dockerfile .")
      }
      stage('Push') {
        docker.withRegistry('https://registry.trustedlife.app') {
          gateway.push("latest")
          bitcoinRpc.push("latest")
          ethereumRpc.push("latest")
          bitcoinListener.push("latest")
          ethereumListener.push("latest")
        }
      }
    }

    stage('Deploy (kubectl)') {
      container('kubectl') {
        sh """
          # without tagging, rollout will not be triggered
          # patch, to force rollout (development envs only)

          kubectl set image -n apis deployment/gateway \
            gateway=${gatewayImage}:latest \
            bitcoin-rpc=${bitcoinRpcImage}:latest \
            bitcoin-listener=${bitcoinListenerImage}:latest \
            ethereum-rpc=${ethereumRpcImage}:latest \
            ethereum-listener=${ethereumListenerImage}:latest

          kubectl patch -n apis deployment/gateway -p '{"spec":{"template":{"metadata":{"labels":{"date":"${label}"}}}}}'

          """
      }
    }
  }
}

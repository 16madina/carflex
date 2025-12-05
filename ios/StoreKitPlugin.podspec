Pod::Spec.new do |s|
  s.name             = 'StoreKitPlugin'
  s.version          = '1.0.0'
  s.summary          = 'Custom StoreKit Plugin for Capacitor'
  s.description      = 'A custom Capacitor plugin for iOS in-app purchases using StoreKit'
  s.homepage         = 'https://github.com/capacitor-community/storekit-plugin'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Capacitor Community' => 'hello@capacitorjs.com' }
  s.source           = { :git => '', :tag => s.version.to_s }
  s.source_files     = 'App/App/Plugins/StoreKitPlugin/**/*.{swift,h,m}'
  s.ios.deployment_target = '14.0'
  s.swift_versions   = '5.0'
  s.dependency 'Capacitor'
  s.dependency 'CapacitorCordova'
end

Pod::Spec.new do |s|
  s.name = 'StoreKitPlugin'
  s.version = '1.0.0'
  s.summary = 'Capacitor plugin for iOS StoreKit In-App Purchases'
  s.license = 'MIT'
  s.homepage = 'https://github.com/yourusername/storekit-plugin'
  s.author = 'Your Name'
  s.source = { :git => 'https://github.com/yourusername/storekit-plugin', :tag => s.version.to_s }
  s.source_files = 'Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target  = '13.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end

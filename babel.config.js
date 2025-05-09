// babel.config.js
module.exports = {
    presets: [
      '@babel/preset-env',
      [
        '@babel/preset-typescript',
        {
          isTSX: true,
          allExtensions: true,
        },
      ],
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }], // 또는 최신 스펙으로 설정 { version: "2023-05" }
      ['@babel/plugin-proposal-class-properties', { loose: true }], // legacy 데코레이터와 호환성을 위해 loose: true 사용
      [
        '@babel/plugin-transform-react-jsx', // React JSX 변환 플러그인을 사용하되, 설정을 Echelon에 맞게 변경
        {
          // runtime: 'automatic',
          // importSource: 'echelon-framework/jsx-runtime', // 사용자 정의 JSX Runtime 경로
          // 만약 classic runtime을 사용한다면:
          pragma: 'createElement', // 예: createElement
          pragmaFrag: 'Fragment',   // 예: Fragment
        },
      ],
    ],
  };
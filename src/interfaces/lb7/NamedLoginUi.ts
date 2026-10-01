export function namedLoginUi(html: string): string {
  return html
    .replace(
      '<label for="token">Credencial de acceso</label><input id="token" name="token" type="password" autocomplete="off" placeholder="Credencial de acceso" required>',
      '<label for="userId">Usuario</label><input id="userId" name="userId" type="text" autocomplete="username" placeholder="Usuario" required><label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" placeholder="Contraseña" required>',
    )
    .replace('<button type="submit">Aplicar credencial</button>', '<button type="submit">Iniciar sesión</button>')
    .replace(
      'La credencial se valida en el servidor y se conserva en una sesión segura.',
      'El usuario y la contraseña se validan en el servidor. La sesión se conserva mediante una cookie segura.',
    );
}

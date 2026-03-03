module.exports = function (options) {
  // Thêm các tùy chọn watch để cải thiện hot reload
  options.watchOptions = {
    poll: 1000,          // Kiểm tra thay đổi file mỗi 1000ms
    aggregateTimeout: 300, // Delay gom các thay đổi trước khi rebuild
  };

  return options;
};

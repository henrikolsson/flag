function Chat(client) {
  this.client = client;
  this.element = document.querySelector(".chat");
}

Chat.prototype.isDisplayed = function() {
  return this.element.style.display !== "none";
};

Chat.prototype.toggle = function() {
  if (!this.isDisplayed()) {
    this.element.style.display = 'block';
    this.element.focus();
    return true;
  } else {
    if (this.element.value && this.element.value.length > 0) {
      this.client.chat(this.element.value);
    }
    this.dismiss();
    return false;
  }
};

Chat.prototype.dismiss = function() {
  this.element.value = "";
  this.element.style.display = 'none';
};

module.exports = Chat;

const Swal = require("sweetalert2");
const userName = "Usuário";

module.exports = {
  swalInform(title = null, text = null, icon = null) {
    title = title ? title : userName;
    text = text ? text : "Salvo com sucesso.";
    icon = icon ? icon : "success";

    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#4caf50',
    });
  },

  swalErrorInform(title = null, text = null, icon = null) {
    title = title ? title : userName;
    text = text
      ? text
      : "Parece que algo deu errado. Por favor, " +
        "revise os dados inseridos e tente novamente.";
    icon = icon ? icon : "error";

    return Swal.fire(
        {
            title,
            text,
            icon,
            confirmButtonColor: '#4caf50',
        }
    )
  },

  swalConfirm(title = null, text = null, icon = null) {
    title = title ? title : userName;
    text = text ? text : "Quer realmente efetuar esta ação?";
    icon = icon ? icon : "warning";

    return Swal.fire({
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "SIM",
      confirmButtonColor: '#4caf50',
      cancelButtonText: "NÃO",
      cancelButtonColor: '#f50057',
      reverseButtons: true,
    }).then((result) => {
      return result.value;
    });
  },
};
